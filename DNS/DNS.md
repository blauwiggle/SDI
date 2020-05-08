# **DNS with bind9**

## **Installing bind9**

We had to install the server and it's utilities to run the bind9 DNS server.

```
apt install bind9
```

## **Change default and global options**

We changed the default configuration in ```/etc/default/bind9``` to run the server in IPv4 ```-4``` mode only.

```
OPTIONS="-4 -u bind"
```

We updated the global options in ```/etc/bind/named.conf.options```.
The trusted section marks the ip addresses of our SDI servers as trusted.
This is important since we only allow recursive requests from trusted ip addresses.
See ```allow-recursion { trusted; };```

```
acl "trusted" {
        141.62.75.108;    # a server
        141.62.75.121;    # b server
};

options {
        directory "/var/cache/bind";

        # enable recursive DNS queries
        recursion yes;
        allow-recursion { trusted; };

        # listen on the private network only
        listen-on { 141.62.75.108; };

        # forward to HdM DNS server and Google's DNS servers
        forwarders { 141.62.64.21;
                     8.8.8.8;
                     8.8.4.4;
                   };

        # default settings for validation and IPv6 configuration
        dnssec-enable no;
        auth-nxdomain no;
        listen-on-v6 { any; };

};
```

To apply the configuration changes we reloaded the server. 

```
service bind9 reload
```

## **Zones configuration**

We set up the forward lookup zone in ```/etc/bind/zones/db.mi.hdm-stuttgart.de```. This maps hostnames to IPv4 adresses. It is to be mentioned here that you have to increase
the serial number of the document each time you save changes. Otherwise the changes will not be loaded at the next server reload.

```
$TTL    604800
@       IN      SOA     ns8.mi.hdm-stuttgart.de. root.mi.hdm-stuttgart.de. (
            2020050401  ; Serial
             604800     ; Refresh
              86400     ; Retry
            2419200     ; Expire
             604800 )   ; Negative Cache TTL
;
; name servers - NS records
     IN      NS      ns8.mi.hdm-stuttgart.de.

; name servers - A records
ns8.mi.hdm-stuttgart.de.       IN      A       141.62.75.108
sdi8a.mi.hdm-stuttgart.de.     IN      A       141.62.75.108
www8-1.mi.hdm-stuttgart.de.    IN      CNAME   ns8.mi.hdm-stuttgart.de.
www8-2.mi.hdm-stuttgart.de.    IN      CNAME   ns8.mi.hdm-stuttgart.de.
```

For the reverse lookup zone we configured ```/etc/bind/zones/db.141.62.75```.

```
$TTL    604800
@       IN      SOA     mi.hdm-stuttgart.de. root.mi.hdm-stuttgart.de. (
                         2020050401     ; Serial
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
; name servers
      IN      NS      ns8.mi.hdm-stuttgart.de.

; PTR Records
108   IN      PTR     sdi8a.mi.hdm-stuttgart.de.
```

We needed to add the new zones in ```/etc/bind/named.conf.local```.

```
zone "mi.hdm-stuttgart.de"{
    type master;
    file "/etc/bind/zones/db.mi.hdm-stuttgart.de"; # zone file path
};

zone "75.62.141.in-addr.arpa" {
    type master;
    file "/etc/bind/zones/db.141.62.75";  # 141.62.75.0/24 class-C subnet
};
```

## **Error handling**

To check the ```/etc/bind/named.conf.local``` we executed the named-checkconf command.

```
named-checkconf /etc/bind/named.conf.local
```

And then we reloaded the bind9 service to apply the changes.

```
service bind9 reload
```

## **Tests**
### Forward lookup
```
dig @141.62.75.108 sdi8a.mi.hdm-stuttgart.de
```

```
root@sdi8a:~# dig @141.62.75.108 sdi8a.mi.hdm-stuttgart.de

; <<>> DiG 9.10.3-P4-Debian <<>> @141.62.75.108 sdi8a.mi.hdm-stuttgart.de
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 36271
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;sdi8a.mi.hdm-stuttgart.de.	IN	A

;; ANSWER SECTION:
sdi8a.mi.hdm-stuttgart.de. 604800 IN	A	141.62.75.108

;; AUTHORITY SECTION:
mi.hdm-stuttgart.de.	604800	IN	NS	ns8.mi.hdm-stuttgart.de.

;; ADDITIONAL SECTION:
ns8.mi.hdm-stuttgart.de. 604800	IN	A	141.62.75.108

;; Query time: 0 msec
;; SERVER: 141.62.75.108#53(141.62.75.108)
;; WHEN: Thu May 07 22:54:45 CEST 2020
;; MSG SIZE  rcvd: 104
```

### Reverse lookup

```dig @141.62.75.108 -x 141.62.75.108```

```
root@sdi8a:~# dig @141.62.75.108 -x 141.62.75.108

; <<>> DiG 9.10.3-P4-Debian <<>> @141.62.75.108 -x 141.62.75.108
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 30230
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 2

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;108.75.62.141.in-addr.arpa.	IN	PTR

;; ANSWER SECTION:
108.75.62.141.in-addr.arpa. 604800 IN	PTR	sdi8a.mi.hdm-stuttgart.de.

;; AUTHORITY SECTION:
75.62.141.in-addr.arpa.	604800	IN	NS	ns8.mi.hdm-stuttgart.de.

;; ADDITIONAL SECTION:
ns8.mi.hdm-stuttgart.de. 604800	IN	A	141.62.75.108

;; Query time: 0 msec
;; SERVER: 141.62.75.108#53(141.62.75.108)
;; WHEN: Thu May 07 22:57:31 CEST 2020
;; MSG SIZE  rcvd: 128
```

### Recursive DNS query

```dig @141.62.75.108 heise.de```

```
root@sdi8a:~# dig @141.62.75.108 heise.de

; <<>> DiG 9.10.3-P4-Debian <<>> @141.62.75.108 heise.de
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 51655
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 5, ADDITIONAL: 9

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 4096
;; QUESTION SECTION:
;heise.de.			IN	A

;; ANSWER SECTION:
heise.de.		86369	IN	A	193.99.144.80

;; AUTHORITY SECTION:
heise.de.		60168	IN	NS	ns.s.plusline.de.
heise.de.		60168	IN	NS	ns.heise.de.
heise.de.		60168	IN	NS	ns.plusline.de.
heise.de.		60168	IN	NS	ns.pop-hannover.de.
heise.de.		60168	IN	NS	ns2.pop-hannover.net.

;; ADDITIONAL SECTION:
ns.s.plusline.de.	60168	IN	A	212.19.40.14
ns.s.plusline.de.	60168	IN	AAAA	2a02:2e0:a:b:c:d:e:f
ns.heise.de.		59884	IN	A	193.99.145.37
ns.heise.de.		59884	IN	AAAA	2a00:e68:14:800::d1ce
ns.plusline.de.		60168	IN	A	212.19.48.14
ns.plusline.de.		60168	IN	AAAA	2a02:2e0:1:2:3:4:5:6
ns.pop-hannover.de.	59884	IN	A	193.98.1.200
ns2.pop-hannover.net.	146284	IN	A	62.48.67.66

;; Query time: 0 msec
;; SERVER: 141.62.75.108#53(141.62.75.108)
;; WHEN: Thu May 07 22:59:04 CEST 2020
;; MSG SIZE  rcvd: 343
```

## **Mail exchange (MX) record configuration**

The last task was to configure the DNS server with a Mail Exchange entry for our domain. We did that by adding a MX record in ```/etc/bind/zones/db.mi.hdm-stuttgart.de```. We used the *not well* configured mail server  ```mx1.hdm-stuttgart.de```.

```
; mail servers mx records
@       IN      MX      10      mx1.hdm-stuttgart.de.
```

After restarting the service with ```service bind9 reload``` we could check the configuration with a ```dig```.

```
service bind9 reload
dig @141.62.75.108 mi.hdm-stuttgart.de MX
dig @141.62.75.108 xy123@mi.hdm-stuttgart.de MX
dig @141.62.75.108 mx1.hdm-stuttgart.de
```