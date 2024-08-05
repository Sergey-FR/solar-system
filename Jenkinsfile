pipeline {
  agent any
    
  environment  {
    REPOSITORY = "docker.io/sergeyfr/solar-system"
    TAG = "${env.BUILD_NUMBER}"
    MONGO_USERNAME = credentials("mongo-username")
    MONGO_PASSWORD = credentials("mongo-password")
    MONGO_URI = "mongodb://localhost:27017"
    MONGO_USERNAME_BASE64 = credentials("mongo-username-base64")
    MONGO_PASSWORD_BASE64 = credentials("mongo-password-base64")
  }
  
  stages {
    stage("Slack Notification") {
      steps {
        slackSend channel: "#solar-system", message: "Build ${env.JOB_NAME}:${env.BUILD_NUMBER} started"
      }
    }

    stage("Clear The Workspace") {
      steps {
        cleanWs()
      }
    }
    
    stage("Checkout The Code") {
      steps {
        git branch: "main", url: "https://github.com/Sergey-FR/solar-system.git"
      }
    }
    
    stage("Validate the Dockerfile") {
      steps {
        sh "docker run --rm -i hadolint/hadolint < Dockerfile"
      }
    }
    
    stage("Build Docker Image") {
      steps {
        sh 'docker build --build-arg MONGO_URI=$MONGO_URI --build-arg MONGO_USERNAME=$MONGO_USERNAME --build-arg MONGO_PASSWORD=$MONGO_PASSWORD -t $REPOSITORY:$TAG .'
      }
    }
    
    stage("Run And Check Application") { 
      steps {
        sh "docker run -d -p 3000:3000 --name solar-system ${REPOSITORY}:${TAG}"
        sleep 10
        sh "curl -f http://localhost:3000 || exit 1"
      }
    }

    stage("Stop And Delete Docker Contain") { 
      steps {
        sh "docker stop solar-system && docker rm solar-system"
      }
    }
    
    stage("Push The Image To The Public Remote Registry") { 
      steps {
        script {
          withDockerRegistry(credentialsId: "docker-credentials") { 
            sh "docker push ${REPOSITORY}:${TAG}"
          }
        }
      }
    }
    
    stage("Deploy To Staging Environment") { 
      environment {
        NAMESPACE="staging"
        REPLICAS=1
        IMAGE="${REPOSITORY}:${TAG}"
        NODEPORT=31000
      }

      steps {
        dir("kubernetes") {
          withKubeConfig(caCertificate: "", clusterName: "minikube", contextName: "", credentialsId: "k8s-credentials", namespace: "staging", restrictKubeConfigAccess: false, serverUrl: "https://localhost:6443") {
            sh "kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
            sh "envsubst < deployment.yaml | kubectl apply -f -"
            sh "envsubst < service.yaml | kubectl apply -f -"
          }
        }
      }
    }
    
    stage("Verify The Staging Deployment") { 
      steps {
        withKubeConfig(caCertificate: "", clusterName: "minikube", contextName: "", credentialsId: "k8s-credentials", namespace: "staging", restrictKubeConfigAccess: false, serverUrl: "https://localhost:6443") {
          sleep 1
          sh "kubectl get all -n staging"
        }
      }
    }
    
    stage("Manual Approval") {
      steps {
        script {
          input message: "Approve deployment to production?", ok: "Deploy"
        }
      }
    }
    
    stage("Deploy To Production Environment") { 
      environment {
        NAMESPACE="production"
        REPLICAS=1
        IMAGE="${REPOSITORY}:${TAG}"
        NODEPORT=32000
      }

      steps {
        dir("kubernetes") {
          withKubeConfig(caCertificate: "", clusterName: "minikube", contextName: "", credentialsId: "k8s-credentials", namespace: "production", restrictKubeConfigAccess: false, serverUrl: "https://localhost:6443") {
            sh "kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -"
            sh "envsubst < deployment.yaml | kubectl apply -f -"
            sh "envsubst < service.yaml | kubectl apply -f -"
          }
        }
      }
    }
    
    stage("Verify The Production Deployment") { 
      steps {
        withKubeConfig(caCertificate: "", clusterName: "minikube", contextName: "", credentialsId: "k8s-credentials", namespace: "production", restrictKubeConfigAccess: false, serverUrl: "https://localhost:6443") {
          sleep 1
          sh "kubectl get all -n production"
        }
      }
    }

    stage("Clean All Resources In Staging Environment") {
      steps {
        withKubeConfig(caCertificate: "", clusterName: "minikube", contextName: "", credentialsId: "k8s-credentials", namespace: "staging", restrictKubeConfigAccess: false, serverUrl: "https://localhost:6443") {
          script {
            sh "kubectl delete all --all -n staging"
            sh "kubectl delete pvc mongo-pvc -n staging"
            sh "kubectl delete namespace staging"
          }
        }
      }
    }
  }
  post {
    success {
        slackSend channel: "#solar-system", message: "Build ${env.JOB_NAME}:${env.BUILD_NUMBER} succeeded (<${env.BUILD_URL}|Open>)"
    }
    
    failure {
        slackSend channel: "#solar-system", message: "Build ${env.JOB_NAME}:${env.BUILD_NUMBER} failed (<${env.BUILD_URL}|Open>)"
    }
}
}
