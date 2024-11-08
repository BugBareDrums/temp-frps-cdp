Make sure you are on the latest version of Node:
`nvm use --lts`

Check out the `new-backend` branch of the [UI repo](https://github.com/DEFRA/ffc-sfd-experiment-ui):

Add the following to your .env file in the[ UI repo](https://github.com/DEFRA/ffc-sfd-experiment-ui):
```
EXPERIMENT_API_BASE_URL="http://localhost:3001"
HOST="http://localhost:3001"
```

Use Postman to import the necessary data:
```
/import-data/options # use Duncan's spreadsheet
/import-data/land-codes # use Landmodel.csv in the `data` folder
```
[link here](https://github.com/BugBareDrums/temp-frps-cdp/blob/main/data/LandModel.csv)
```
npm run seed
npm run dev
```
