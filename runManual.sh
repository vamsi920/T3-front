sudo yum install git -y

git clone https://vamsi920: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@github.com/vamsi920/T3-front.git

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

source ~/.bashrc

nvm install --lts

npm install

touch .env

echo "REACT_APP_QR_BACKEND_URL=http://52.54.180.233:105" >> .env
echo "REACT_APP_QR_OPENFDA_SEARCH_URL=https://api.fda.gov/drug/ndc.json?search=product_ndc:" >> .env

npm run start






