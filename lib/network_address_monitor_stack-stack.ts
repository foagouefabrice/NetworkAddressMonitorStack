import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchactions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { aws_logs as logs} from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';


export class NetworkAddressMonitorStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
     // Define the VPC and subnet IDs
     const vpcId = 'vpc-01b5ac0e698c10c6a';
     const subnetId = 'subnet-09a299394cf9a2436';

     // Create the CloudWatch alarm
     const alarm = new cloudwatch.Alarm(this, 'NetworkAddressAvailabilityAlarm', {
       metric: new cloudwatch.Metric({
         namespace: 'Custom/Subnet/IPAvailability',
         metricName: 'AvailableIpAddressCount',
         dimensionsMap: {
           VpcId: vpcId,
           SubnetId: subnetId,
         },
         statistic: 'Minimum',
         period: cdk.Duration.minutes(5),
       }),
       threshold: 10,
       evaluationPeriods: 1,
       comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
     });
 
     // Create the SNS topic
     const topic = new sns.Topic(this, 'NetworkAddressAvailabilityTopic');
     topic.addSubscription(new subscriptions.EmailSubscription('fofafranck@yahoo.fr'));
 
     // Create the IAM role for CloudWatch to publish to SNS
     const role = new iam.Role(this, 'NetworkAddressAvailabilityRole', {
       assumedBy: new iam.ServicePrincipal('cloudwatch.amazonaws.com'),
     });
 
     // Allow CloudWatch to publish to SNS
     topic.grantPublish(role);
 
     // Create the CloudWatch action to publish to SNS
     const action = new cloudwatchactions.SnsAction(topic);
 
     // Add the action to the alarm
     alarm.addAlarmAction(action);
   }
 }
 