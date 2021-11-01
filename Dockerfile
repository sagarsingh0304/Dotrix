FROM ubuntu:latest
RUN apt-get update
RUN apt-get -y install python3-pip

WORKDIR /app
COPY . /app

RUN pip3 --no-cache-dir install -r requirements.txt

EXPOSE 5000
ENTRYPOINT [ "python3" ]

CMD [ "server.py" ]