FROM nginx:1.16.0

# Website
COPY ./build /var/www
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

# API
RUN apt-get update && apt-get -y install python3 python3-pip libglib2.0 python3-dev build-essential libsm6 libxext6 libxrender-dev chromium wget unzip && apt-get clean

RUN wget https://chromedriver.storage.googleapis.com/75.0.3770.140/chromedriver_linux64.zip && \
    unzip chromedriver_linux64.zip && \
    mv chromedriver /usr/bin/chromedriver && \
    chmod +x /usr/bin/chromedriver

COPY ./api /opt/api
WORKDIR /opt/api
RUN pip3 install -r requirements.txt

RUN python3 -c 'import cv2; import selenium; print("Python: - SUCCESS")'

EXPOSE 8080

RUN useradd www
RUN usermod -a -G www www
RUN chmod -R 770 /opt/api && \
    chown -R www:www /opt/api

# Running
COPY exec.sh /opt
CMD sh /opt/exec.sh