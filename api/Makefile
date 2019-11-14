PYTHON=python

.PHONY: setup
setup:
	mkdir shared
	sh docker/keys.sh

.PHONY: tests
tests: setup
	$(PYTHON) -m pytest tests/* -vv
	rm -r shared screenshots keys

.PHONY: clean
clean:
	find . -name ".pytest*" | xargs rm -rf
	find . -name "__pycache__" | xargs rm -rf