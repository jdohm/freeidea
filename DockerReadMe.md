# short description to run the docker file
# NOT MAINTAINED! only stays here for potential later readaption
Build Dockerimage using `docker build -t freeidea:0.6 .`
Start Dockercontrainer using `docker container run --name freeIdea -p 80:8081 freeidea:0.6`
Start Dockercontrainer with certs using `sudo docker container run --name freeIdea -v /etc/letsencrypt:/etc/letsencrypt -p 80:8081 freeidea:0.6`
Start Dockercontrainer with certs using and db outside `sudo docker container run --name freeIdea -v /etc/letsencrypt:/etc/letsencrypt -p 80:8081 -p 443:443 freeidea:0.6`
Start terminal inside running container `docker container exec -it freeIdea /bin/bash`
