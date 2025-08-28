echo "Removing any sourceMappingURLs from ajv"
for i in `find node_modules/ajv -name \*.js -type f`
do
	perl -p -i.bak -e 's|//# sourceMappingURL=.*$||' $i
done

echo "Removing any sourceMappingURLs from ajv-formats"
for i in `find node_modules/ajv-formats -name \*.js -type f`
do
	perl -p -i.bak -e 's|//# sourceMappingURL=.*$||' $i
done

echo "Removing any sourceMappingURLs from uri-js"
for i in `find node_modules/uri-js -name \*.js -type f`
do
	perl -p -i.bak -e 's|//# sourceMappingURL=.*$||' $i
done