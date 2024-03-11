sudo yum update -y
sudo yum install git -y 

rm -rf T3-front

git clone https://vamsi920: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@github.com/vamsi920/T3-front.git


curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

source ~/.bashrc

nvm install --lts

cd T3-front
npm cache clean --force
npm install --no-optional
cd ..

touch T3-front/.env

echo "REACT_APP_QR_BACKEND_URL=http://localhost:105" >> T3-front/.env
echo "REACT_APP_QR_OPENFDA_SEARCH_URL=https://api.fda.gov/drug/ndc.json?search=product_ndc:" >> T3-front/.env

npm run start






