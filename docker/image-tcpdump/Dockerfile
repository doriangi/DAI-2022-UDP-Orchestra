FROM ubuntu:23.04

RUN apt-get update && apt-get install -y tcpdump

CMD [ "tcpdump", "udp", "port", "3000" ]