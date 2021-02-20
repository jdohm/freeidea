# short description to run the docker file
Build Dockerimage using `sudo docker build -t freeidea:0.5 .`
Start Dockercontrainer using `sudo docker container run --name freeIdea -p 80:8081 freeidea:0.5`
Start terminal inside running container `docker container exec -it freeIdea /bin/bash`
