#!/bin/sh

# Generate keys for push notifications

if [ ! -f "./keys" ]; then
    mkdir "keys"
fi

if [ ! -f "./keys/key" ]; then
    cd keys
    vapid --gen
    vapid --applicationServerKey | sed -e 's/Application Server Key = //g' > key
    echo "Created push keys!"
fi