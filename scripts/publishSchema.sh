#!/usr/bin/env sh

# Remove previously published schema
rm -rf ./public
mkdir public

# For exisiting v2 and v3 schemas, do not publish, instead
# reuse the ones from OpenAttestation. Only if there is a
# base schema change for v2 and v3 then one would need to
# publish

# Copy 2.0 schema to public folder
# mkdir -p public/2.0/
# cp src/2.0/schema/schema.json public/2.0/schema.json

# Copy 3.0 schema to public folder
# mkdir -p public/3.0/
# cp src/3.0/schema/schema.json public/3.0/schema.json

# Copy 4.0 schema to public folder
mkdir -p public/4.0/
cp src/4.0/schema/schema.json public/4.0/schema.json
