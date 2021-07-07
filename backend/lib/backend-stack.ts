import * as cdk from '@aws-cdk/core';
import * as appsync from "@aws-cdk/aws-appsync";
import * as cognito from "@aws-cdk/aws-cognito";
import * as ec2 from "@aws-cdk/aws-ec2"
import * as iam from "@aws-cdk/aws-iam"
import * as neptune from "@aws-cdk/aws-neptune"
import * as lambda from "@aws-cdk/aws-lambda"
import * as events from "@aws-cdk/aws-events"
import * as eventTargets from "@aws-cdk/aws-events-targets"
import { EVENT_SOURCE, responseTemplate, requestTemplate } from "../utils/appsync-request-response"

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const userPool = new cognito.UserPool(this,"userPool-DiningByFriends",{
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      autoVerify: {email: true},
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        },
        phoneNumber: {
          required: true,
          mutable: true
        }
      }

    })

    const userPoolClient = new cognito.UserPoolClient(this,"userPoolClient-diningByFriends",{
      userPool
    })

    const adminGroup =  new cognito.CfnUserPoolGroup(this,"diningByFriends_admingroup",{
      groupName: 'admins',
      userPoolId: userPool.userPoolId,

    })

    //AppsyncAPI only be allowed with userPool

    const saasApi = new appsync.GraphqlApi(this,'diningByFriendsAPI',{
      name: 'DiningByFriendsAPI',
      schema: appsync.Schema.fromAsset('graphql/schema.gql'),
      authorizationConfig: {
        defaultAuthorization: {
          userPoolConfig: {userPool},
          authorizationType: appsync.AuthorizationType.USER_POOL,
        
        },
      },

      logConfig: {
        fieldLogLevel: appsync.FieldLogLevel.ALL
      },
      xrayEnabled: true,
      
    })

    const vpc = new ec2.Vpc(this, 'NeptuneVPC',{
      // maxAzs: 2,
      subnetConfiguration: [{
        subnetType: ec2.SubnetType.ISOLATED,
        name: "Ingress",
        cidrMask: 24
      }],
      //enableDnsHostnames: true,
      //enableDnsSupport: true
    })

    // const amazonLinux = ec2.MachineImage.latestAmazonLinux({
    //   generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
    //   edition: ec2.AmazonLinuxEdition.STANDARD,
    //   virtualization: ec2.AmazonLinuxVirt.HVM,
    //   storage: ec2.AmazonLinuxStorage.EBS

    // });

    // const role = new iam.Role(this,"MyEc2",{
    //   assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com")
    // })

    // const ec2Instance = new ec2.Instance(this,"MyInstance",{
    //   instanceType: new ec2.InstanceType("t2.micro"),
    //   machineImage: amazonLinux,
    //   vpc,
    //   keyName: "my-ec2-key",
    //   role,
    // })

    // const roleA = new iam.Role(this,"MyNeptune",{
    //   assumedBy: new iam.ServicePrincipal("rds.amazonaws.com")

    // })

    const roleMutationLambda = new iam.Role(this,"lambdaAccessAppsync",{
      assumedBy: new iam.ServicePrincipal("lambda-amazonaws.com")
    })

    const policyMutationLambda = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "appsync:*",
        "logs:*",
        "lambda:*",
        "rds:*",
        "iam:*"

      ],
      resources: ["*"]
    })
    roleMutationLambda.addToPolicy(policyMutationLambda)

    // const policyA = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: [
    //     "s3:*",
    //     "logs:*",
    //     "lambda:*",
    //     "cloudformation:*Stack",
    //     "ec2:*",
    //     "rds:*",
    //     "iam:*",
    //     "ssm:GetParameters",
    //   ],
    //   resources: ["*"]
    // })

    // //granting IAM permissions to role
    // roleA.addToPolicy(policyA)

    // Create a security group and subnetgroup to ensure ec2 and neptune cluster deploy on the same vpc
    const sg1 = new ec2.SecurityGroup(this,"mySecurityGroup1",{
      vpc,
      allowAllOutbound: true,
      description: "security group 1",
      securityGroupName: "mySecurityGroup",
    })

    cdk.Tags.of(sg1).add("Name","mySecurityGroup");

    sg1.addIngressRule(sg1, ec2.Port.tcp(8182), "MyRule")

    const neptuneSubnet = new neptune.CfnDBSubnetGroup(this,"neptuneSubmitGroup",{
      dbSubnetGroupDescription: "My Subnet",
      subnetIds: vpc.selectSubnets({
        subnetType: ec2.SubnetType.ISOLATED
      }).subnetIds,
      dbSubnetGroupName: "mysubnetgroup"

    })

    // Creating neptune cluster
    const neptuneCluster = new neptune.CfnDBCluster(this,"MyCluster",{
      dbSubnetGroupName: neptuneSubnet.dbSubnetGroupName,
      dbClusterIdentifier: "myNaptuneDBCluster",
      vpcSecurityGroupIds: [sg1.securityGroupId]

    })

   
    neptuneCluster.addDependsOn(neptuneSubnet)

    // Creating neptune instance

    const neptuneInstance = new neptune.CfnDBInstance(this,"myinstance",{
      dbInstanceClass: "db.t3.medium",
      dbClusterIdentifier: neptuneCluster.dbClusterIdentifier,
      availabilityZone: vpc.availabilityZones[0]

    });
    neptuneInstance.addDependsOn(neptuneCluster)

  

    const queryLambda = new lambda.Function(this,"LambdaForQuery",{
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.AssetCode("lambda/queryLambda"),
      handler: "index.handler",
      vpc: vpc,
      securityGroups: [sg1],
      environment: {
        NEPTUNE_READER: neptuneCluster.attrReadEndpoint
      },
      vpcSubnets: {
        subnetType: ec2.SubnetType.ISOLATED
      }
    })

    const mutationLambda = new lambda.Function(this,"LambdaForMutation",{
      runtime: lambda.Runtime.NODEJS_12_X,
      code: new lambda.AssetCode("lambda/mutationLambda"),
      handler: "index.handler",
      vpc,
      securityGroups: [sg1],
      environment: {
        NEPTUNE_WRITER: neptuneCluster.attrEndpoint
      },
      vpcSubnets: {
        subnetType: ec2.SubnetType.ISOLATED
      },
      role: roleMutationLambda,
      
    })

    mutationLambda.addEnvironment("APPSYNC_ENDPOINT_URL", saasApi.graphqlUrl)
    //mutationLambda.addEnvironment("AWS_REGION",this.region)



    //Defining SaasAPI Data source for Query

    const queryLambdaResource = saasApi.addLambdaDataSource("queryLambdaResource",queryLambda)

    //Defining Resolvers for Query

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getRestaurants"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getPersons"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getCities"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getStates"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getCuisines"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getReviewRatings"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getFriendRequests"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getPersonById"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getFriends"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getRestaurantNewestReviews"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getMyFriendsOfFriends"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getXRelatedToY"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getRestaurantHighestRatedNearMeCuisineSpecific"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getTenRestaurantsHighestRattedNearMe"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getRestaurantsMyFriendRecommend"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getBestRestaurantsOnBasedMyFriendsRating"
    })

    queryLambdaResource.createResolver({
      typeName: "Query",
      fieldName: "getRestaurantsMyFreindsReviewedRatedPastXDays"
    })

    //Defining DataSource for mutation that will generate events

    const httpDataSource = saasApi.addHttpDataSource("ds",`https://events.${this.region}.amazonaws.com/`,{
      name: "httpsDsWithEventBridge",
      description: "From Appsync to Eventbridge",
      authorizationConfig: {
        signingRegion: this.region,
        signingServiceName: "events"
      }
    })

    events.EventBus.grantAllPutEvents(httpDataSource)

    //Defining Resolvers for Mutation


    /* Mutation */

    const mutations = ["createPerson","createRestaurant","createReview","createReviewRating","sendFriendRequest","acceptFriendRequest","createCuisine","createCity","createState"]

    mutations.forEach((mut)=>{
      let details = `\\\"id\\\": \\\"$ctx.args.id\\\"`;

      if (mut === "createPerson"){
        details = `\\\"firstName\\\":\\\"$ctx.args.personDetail.firstName\\\",\\\"lastName\\\":\\\"$ctx.args.personDetail.lastName\\\",\\\"email\\\":\\\"$ctx.args.personDetail.email\\\"`

      } else if (mut === "createRestaurant") {
        details = `\\\"name\\\":\\\"$ctx.args.restaurantDetail.name\\\",\\\"address\\\":\\\"$ctx.args.restaurantDetail.address\\\",\\\"city\\\":\\\"$ctx.args.restaurantDetail.city\\\",\\\"state\\\":\\\"$ctx.args.restaurantDetail.state\\\",\\\"cuisine\\\":\\\"$ctx.args.restaurantDetail.cuisine\\\"`

      } else if (mut === "createReview"){
        details = `\\\"rating\\\":\\\"$ctx.args.reviewDetail.rating\\\",\\\"body\\\":\\\"$ctx.args.reviewDetail.body\\\",\\\"aboutRestaurant\\\":\\\"$ctx.args.reviewDetail.aboutRestaurant\\\",\\\"myId\\\":\\\"$ctx.args.reviewDetail.myId\\\"`

      } else if (mut === "createReviewRating"){
        details = `\\\"rating\\\":\\\"$ctx.args.reviewRatingDetail.rating\\\","aboutReview\\\":\\\"$ctx.args.reviewRatingDetail.aboutReview\\\","myId\\\":\\\"$ctx.args.reviewRatingDetail.myId\\\"`

      } else if (mut === "sendFriendRequest"){
        details = `\\\"myId\\\":\\\"$ctx.args.myIdAndFriendId.myId\\\",\\\"firendId\\\":\\\"$ctx.args.myIdAndFriendId.firendId\\\"`

      } else if (mut === "acceptFriendRequest"){
        details = `\\\"myId\\\":\\\"$ctx.args.myIdAndFriendId.myId\\\",\\\"firendId\\\":\\\"$ctx.args.myIdAndFriendId.firendId\\\"`

      } else if (mut === "createCuisine"){
        details = `\\\"cuisineName\\\":\\\"$ctx.args.cuisineName\\\"`

      } else if (mut === "createCity"){
        details = `\\\"cityName\\\":\\\"$ctx.args.cityName\\\"`

      } else if (mut === "createState"){
        details = `\\\"stateName\\\":\\\"$ctx.args.stateName\\\"`

      } else if (mut === "addionOfResouces"){
        details = `\\\"action\\\":\\\"$ctx.args.action\\\"`

      }

      httpDataSource.createResolver({
        typeName: "Mutation",
        fieldName: mut,
        requestMappingTemplate: appsync.MappingTemplate.fromString(requestTemplate(details,mut)),
        responseMappingTemplate: appsync.MappingTemplate.fromString(responseTemplate())
      })

    })

    new events.Rule(this,"ruleForConsumer",{
      eventPattern: {
        source: [EVENT_SOURCE],
        detailType: [...mutations,],
      },
      targets: [new eventTargets.LambdaFunction(mutationLambda)]
    })

    //Creating no Data source for subscription

    const noDataSource = saasApi.addNoneDataSource("noDataSource",{
      name: "noDataSource",
      description: "Does not save incoming data. It is for subscription"
    });

    noDataSource.createResolver({
      typeName: "Mutation",
      fieldName: "addionOfResouces",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`{
        "version" : "2017-02-28",
        "payload": $util.toJson($context.arguments)
      }`),
      responseMappingTemplate: appsync.MappingTemplate.fromString("$util.toJson($context.result)")
    })







  }
}
