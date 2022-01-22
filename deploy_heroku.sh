#! /bin/bash
heroku container:push --app=nomnom-api1 web
heroku container:release --app=nomnom-api1 web


# Login before running commands above
# heroku login
# heroku container:login