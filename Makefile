PYTHON=python

.PHONY: pull
pull:
	docker pull ivanch/notificc-web:builder
	docker pull ivanch/notificc-web:latest
	docker pull ivanch/notificc-api:latest

.PHONY: build-api
build-api:
	docker build \
		--force-rm \
		--cache-from ivanch/notificc-api:latest \
		--tag ivanch/notificc-api:latest ./api

.PHONY: build-web
build-web-builder:
	cd web
	docker build \
		--target builder \
		--force-rm \
		--cache-from ivanch/notificc-web:builder \
		--tag ivanch/notificc-web:builder ./web

.PHONY: build-web
build: build-web-builder
	docker build
		--force-rm
		--target stage
		--cache-from ivanch/notificc-web:builder
		--cache-from ivanch/notificc-web:latest
		--tag ivanch/notificc-web:latest ./web

.PHONY: build
build:	build-api build-web