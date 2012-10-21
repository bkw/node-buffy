results/ascii-strings-binary.csv: binary.js fixtures/ascii-strings.bin
	node $^ | tee $@

results/ascii-strings-buffy.csv: buffy.js fixtures/ascii-strings.bin
	node $^ | tee $@

results/100k-blog-rows.mysql-buffy.csv: buffy-mysql.js fixtures/100k-blog-rows.mysql.bin
	node $^ | tee $@

fixtures/ascii-strings.bin: fixtures/generate-strings.js
	node $^ $@

fixtures/100k-blog-rows.mysql.bin:
	node fixtures/downloadFixture.js \
		http://felixge.s3.amazonaws.com/12/100k-blog-rows.mysql $@
