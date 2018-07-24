# CFN-HA-Fast

CloudFormation template for HA Fastify app in an ASG


## Validate the cfn template

- `aws cloudformation validate-template --template-body=file://cfn-ha-fast.json`


## Tutorial

### 1. Make sure to have an ssh key-pair globally available across all azs.

create a key pair : `ssh-keygen -f ~/.ssh/new-key_rsa -t rsa -b 4096`
import to aws : `aws ec2 import-key-pair --key-name new-key --public-key-material file://~/.ssh/new-key_rsa.pub`

### 2. Find or Create a VPC

vpc needs at least 2 subnets in 2 different azs, and one subnet attached to an igw

- create: `aws ec2 create-vpc --cidr-block 10.1.0.0/16 --tags Key=Name,Value=NewVPC`

#### Create 3 subnets

_note the subnet ids_

- export VPCID `export VPCID=$(aws ec2 describe-vpcs | grep '10.1.0.0/16' | awk '{print $7}')`
- create igw `export IGWID=$(aws ec2 create-internet-gateway | awk '{print $2}')`
- attach the igw to vpc `aws ec2 attach-internet-gateway --vpc-id $VPCID --internet-gateway-id $IGWID`
- create subnet in us-west-2a : `aws ec2 create-subnet --vpc-id $VPCID --cidr-block 10.1.1.0/24 --availability-zone us-west-2a`
- create subnet in us-west-2b : `aws ec2 create-subnet --vpc-id $VPCID --cidr-block 10.1.2.0/24 --availability-zone us-west-2b`
- create subnet in us-west-2c : `aws ec2 create-subnet --vpc-id $VPCID --cidr-block 10.1.3.0/24 --availability-zone us-west-2c`

### 3. Create the Stack

Using the 3 subnets created in step 2.
Example : `subnet-00001cat, subnet-00002bed, subnet-00003ded`

**Review the ParameterValues below**

_make sure you have $VPCID exported_ if not, then set it `export VPCID=$(aws ec2 describe-vpcs | grep '10.1.0.0/16' | awk '{print $7}')`

```sh
aws cloudformation create-stack \
--stack-name cfn-ha-fast \
--template-body file://cfn-ha-fast.json \
--parameters \
ParameterKey=VpcId,ParameterValue=$VPCID \
ParameterKey=KeyName,ParameterValue=new-key \
ParameterKey=OperatorEMail,ParameterValue=your@emailaddress.com \
'ParameterKey=Subnets,ParameterValue="subnet-00001cat,subnet-00002bed,subnet-00003ded"'
```

### 4. Inspect Stack Events

```sh
aws cloudformation describe-stack-events --stack-name cfn-ha-fast --output json
```

### 5. Destroy the Stack

```sh
aws cloudformation delete-stack --stack-name cfn-ha-fast
```

