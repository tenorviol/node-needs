
test: nodeunit

nodeunit:
	nodeunit test

docs: docco

docco:
	rm -rf docs
	docco lib/*.js