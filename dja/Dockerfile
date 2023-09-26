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

RUN adduser --disabled-password --no-create-home django
RUN chown -R django:django /usr/src
RUN chown -R django:django /usr/src/app

USER django

