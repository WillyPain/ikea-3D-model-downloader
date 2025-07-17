#!/bin/sh
curl "$1" --output "$2"
npx gltf-transform copy "$2" "$3"