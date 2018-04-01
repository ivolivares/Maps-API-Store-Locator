#!/bin/bash

openssl req -new -x509 -keyout localsecure.pem -out localsecure.pem -days 365 -nodes
