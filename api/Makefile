PYTHON=python

.PHONY: setup
setup:
	mkdir shared
	sh docker/keys.sh

.PHONY: clean
clean:
	find . -name ".pytest*" | xargs rm -rf
	find . -name "__pycache__" | xargs rm -rf
	if [ -d "shared" ]; then rm -r shared; fi
	if [ -d "screenshots" ]; then rm -r screenshots; fi
	if [ -d "keys" ]; then rm -r keys; fi

.PHONY: tests
tests: clean setup
	$(PYTHON) -m pytest tests/* -vv