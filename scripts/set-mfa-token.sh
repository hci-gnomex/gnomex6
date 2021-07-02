#!/bin/bash
# credit to Prasad Domaia

MFA_PROFILE_NAME=$1
BASE_PROFILE_NAME=$2

DEFAULT_REGION="us-west-2"
DEFAULT_JSON="json"
MFA_SERIAL=$3
MFA_SERIAL=`cat $MFA_SERIAL`

GENERATE_ST="true"

MFA_PROFILE_EXISTS=`more ~/.aws/credentials | grep $MFA_PROFILE_NAME | wc -l`
if [ $MFA_PROFILE_EXISTS -eq 1 ]; then
    EXPIRATION_TIME=$(aws configure get expiration --profile $MFA_PROFILE_NAME)
    NOW=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

    if [[ "$EXPIRATION_TIME" > "$NOW" ]]; then
        echo "The Session Token is still valid. New Security Token not required."
        GENERATE_ST="false"
    fi
fi

if [ "$GENERATE_ST" = "true" ]; then
    read -p "Token code for MFA Device ($MFA_SERIAL):" TOKEN_CODE
    echo "Generating new IAM STS Token..."
    read -r AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN EXPIRATION AWS_ACCESS_KEY_ID < <(aws sts get-session-token --profile $BASE_PROFILE_NAME --output text --query 'Credentials.*' --serial-number $MFA_SERIAL --token-code $TOKEN_CODE)
    if [ $? -ne 0 ]; then
        echo "An error occured. AWS credentials file not updated"
    else
        aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY" --profile $MFA_PROFILE_NAME
        aws configure set aws_session_token "$AWS_SESSION_TOKEN" --profile $MFA_PROFILE_NAME
        aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID" --profile $MFA_PROFILE_NAME
        aws configure set expiration "$EXPIRATION" --profile $MFA_PROFILE_NAME
        aws configure set region "$DEFAULT_REGION" --profile $MFA_PROFILE_NAME
        aws configure set output "$DEFAULT_OUTPUT" --profile $MFA_PROFILE_NAME
        echo "STS Session Token generated and updated in AWS credentials file successfully."
    fi

fi
