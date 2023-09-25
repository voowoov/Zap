FROM python:3.10-alpine

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /usr/src/app

RUN apk add --update --no-cache gettext

COPY ./requirements.txt /usr/src/app/requirements.txt
RUN apk add --no-cache --virtual .tmp build-base linux-headers \
    && pip install --upgrade pip \
    && pip install -r requirements.txt \
    && apk del .tmp

### to install Channels and Daphne
# RUN python -m pip install -U channels["daphne"]
### And other than channels installs are in requirements.txt
### remove previously installed apk that was just to install requirements.txt, to make the container lighter
# RUN apk del apk-tools

### only works if static folder is inside app folder (but static folder inside app folder gets copied and takes disk space...)
# RUN python -m manage collectstatic -v 3 --no-input

RUN adduser --disabled-password --no-create-home django
### directories own by user, meaning with write permission for user (default 755 drwxr-xr-x)
### for sqlite database to be available to django, make the user own the database directory
RUN chown -R django:django /usr/src
RUN chown -R django:django /usr/src/app

USER django
