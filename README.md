# 梅林固件专用frp服务器Brian修改版

本修改版在原版的基础上主要增加了如下修改：

1. 增加了远程唤醒与关闭frp客户端的功能。这样frp客户端不必一直与服务端保持连接，而是仅在需要使用的时候，进行唤醒即可。
    > 远程唤醒与关闭frpc客户端功能，路由器端依赖梅林aliddns插件，客户端辅助脚本[AliDDNS脚本](https://github.com/ChenWenBrian/AliDDNS)

    - 优点是增加了`客户端的隐蔽性`与`服务端的安全性`；

    - 缺点是操作上相对会繁琐一些，每次使用远程资源时，需先经过路由器的frps管理页进行唤醒；工作完成后还需额外的关闭操作；

2. 修改了部分提示，方便关闭vhost http(s) port；
3. 增加了FRPS面板的超链接以及自动授权登陆FRPS控制面板；

---

## Koolshare Asuswrt-Merlin Frps Changelog

> PS: 程序版本号与官方最新原版保持一致，这样梅林软件中心就不会显示升级小图标了

[1.4.16-0.31.1 ( 2020-01-15 13:00 )](https://github.com/ChenWenBrian/merlin_frps/releases/tag/1.4.16-0.31.1)
 - update 程序：增加了对梅林固件380.70_0-X7.9.1的兼容(**注：之前的版本是基于x7.9.0以前的版本开发，在x7.9.1的固件上会出现dbus不兼容的情况，导致远程唤醒无响应**)
 - 更新frp服务端到0.31.1版本

[1.4.16-0.27-fix ( 2019-06-30 16:00 )](https://github.com/ChenWenBrian/merlin_frps/releases/tag/1.4.16-0.27-fix)
 - update 程序：增加了对梅林固件380.70_0-X7.9.1的兼容(**注：之前的版本是基于x7.9.0以前的版本开发，在x7.9.1的固件上会出现dbus不兼容的情况，导致远程唤醒无响应**)

[1.4.16-0.27 ( 2019-06-29 12:00 )](https://github.com/ChenWenBrian/merlin_frps/releases/tag/1.4.16-0.27)
 - update 程序：更新frp服务端到0.27.0版本(**注：0.25以上版本的客户端的xtcp与0.25以前的版本不兼容**)

[1.4.16-0.24 ( 2019-05-21 20:00 )](https://github.com/ChenWenBrian/merlin_frps/releases/tag/1.4.16-0.24)
 - update 程序：更新frp服务端到0.24.0版本

[1.4.16-0.21 ( 2018-08-14 22:00 )](https://github.com/ChenWenBrian/merlin_frps/releases/tag/1.4.16-0.21)
 - update 程序：更新frp服务端到0.21.0版本
 - update 提示：增加远程控制客户端启动与停止连接功能（客户端需[AliDDNS脚本](https://github.com/ChenWenBrian/AliDDNS)）

1.4.15 ( 2018-05-30 22:00 )
 - update 程序：更新frp服务端到0.19.1版本
 - update 提示：修改了一些提示，方便关闭vhost http(s) port
 - add 设置：增加frps dashboard的图标和超链接，方便访问

---
1.4.14 ( 2018-01-31 17:00 )
  - update    程序：更新frp服务端到0.16.0版本

1.4.13 ( 2017-09-21 20:55 )
  - Fix       脚本：修正开启启动小问题

1.4.13 ( 2017-09-13 15:00 )
  - Fix       脚本：修正开启启动小问题
  
1.2.13 ( 2017-09-13 15:00 )
  - update    程序：更新frp服务端到0.13.0版本