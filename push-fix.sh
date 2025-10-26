#!/bin/bash

cd /home/risinglion/fortune-investment-platform

git add .
git commit -m "Fix: Database permissions error in production

- Modified Payment model to skip table creation in production
- Added production setup and environment validation scripts
- Fixed 'must be owner of table payments' error on Render"

git push origin main

echo "✅ Changes pushed! Add M-PESA environment variables to Render."