# Google drive api tools for NodeJS

## Functionality overview

It's a simple javascript library that contains some methods to simplify the use of googleapis in NodeJS for basic needs:

-   list - to list the file in a folder
-   upload - to upload a file
-   download - to download a file
-   createFolder - to create a new folder
-   remove - to remove a file or a folder
-   info - to get info about a file

## Authentication

You need to create a service account for your google cloud application project and share with it a folder of your google account whose drive space you want to use. The authentication part works through JWT tokens. For the authentication, you'll only need the service account's client_email and private_key.

## Authors

-   [Ang3loDF](https://github.com/Ang3loDF) - Angelo Di Fuccia
