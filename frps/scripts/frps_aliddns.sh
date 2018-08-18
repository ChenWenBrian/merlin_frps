#!/bin/sh

eval `dbus export aliddns_`
eval `dbus export frps_aliddns_`

now=`date`

die () {
    echo $1
    dbus ram frps_aliddns_last_act="$now: failed($1)"
}

[ "$aliddns_curl" = "" ] && aliddns_curl="curl -s whatismyip.akamai.com"
[ "$aliddns_dns" = "" ] && aliddns_dns="223.5.5.5"
[ "$aliddns_ttl" = "" ] && aliddns_ttl="600"

ip=$frps_aliddns_action
if [ $frps_aliddns_action = "start" ]
then
	ip=`$aliddns_curl 2>&1` || die "$ip"
else
	ip="0.0.0.0"
fi

current_ip=`nslookup $frps_aliddns_name.$aliddns_domain $aliddns_dns 2>&1`

if [ "$?" -eq "0" ]
then
    current_ip=`echo "$current_ip" | grep 'Address 1' | tail -n1 | awk '{print $NF}'`

    if [ "$ip" = "$current_ip" ]
    then
        echo "skipping"
        dbus set frps_aliddns_last_act="$now: skipped($ip)"
        exit 0
    fi 
fi


timestamp=`date -u "+%Y-%m-%dT%H%%3A%M%%3A%SZ"`

urlencode() {
    # urlencode <string>
    out=""
    while read -n1 c
    do
        case $c in
            [a-zA-Z0-9._-]) out="$out$c" ;;
            *) out="$out`printf '%%%02X' "'$c"`" ;;
        esac
    done
    echo -n $out
}

enc() {
    echo -n "$1" | urlencode
}

send_request() {
    local args="AccessKeyId=$aliddns_ak&Action=$1&Format=json&$2&Version=2015-01-09"
    local hash=$(echo -n "GET&%2F&$(enc "$args")" | openssl dgst -sha1 -hmac "$aliddns_sk&" -binary | openssl base64)
    curl -s "http://alidns.aliyuncs.com/?$args&Signature=$(enc "$hash")"
}

get_recordid() {
    grep -Eo '"RecordId":"[0-9]+"' | cut -d':' -f2 | tr -d '"'
}

query_recordid() {
    send_request "DescribeSubDomainRecords" "SignatureMethod=HMAC-SHA1&SignatureNonce=$timestamp&SignatureVersion=1.0&SubDomain=$frps_aliddns_name.$aliddns_domain&Timestamp=$timestamp"
}

update_record() {
    send_request "UpdateDomainRecord" "RR=$frps_aliddns_name&RecordId=$1&SignatureMethod=HMAC-SHA1&SignatureNonce=$timestamp&SignatureVersion=1.0&TTL=$aliddns_ttl&Timestamp=$timestamp&Type=A&Value=$ip"
}

add_record() {
    send_request "AddDomainRecord&DomainName=$aliddns_domain" "RR=$frps_aliddns_name&SignatureMethod=HMAC-SHA1&SignatureNonce=$timestamp&SignatureVersion=1.0&TTL=$aliddns_ttl&Timestamp=$timestamp&Type=A&Value=$ip"
}

if [ "$frps_aliddns_record_id" = "" ]
then
    frps_aliddns_record_id=`query_recordid | get_recordid`
fi
if [ "$frps_aliddns_record_id" = "" ]
then
    frps_aliddns_record_id=`add_record | get_recordid`
    echo "added record $frps_aliddns_record_id"
else
    update_record $frps_aliddns_record_id
    echo "updated record $frps_aliddns_record_id"
fi

# save to file
if [ "$frps_aliddns_record_id" = "" ]; then
    # failed
    dbus ram frps_aliddns_last_act="$now: failed"
else
    dbus ram frps_aliddns_record_id=$frps_aliddns_record_id
    dbus ram frps_aliddns_last_act="$now: success($ip)"
fi