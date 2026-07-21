pipeline {
    agent any

    environment {
        DOCKER_USER = "abdullahahmed1101076"
        IMAGE_TAG   = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                docker compose build

                docker tag ${DOCKER_USER}/dataflow-backend:latest \
                           ${DOCKER_USER}/dataflow-backend:${IMAGE_TAG}

                docker tag ${DOCKER_USER}/dataflow-frontend:latest \
                           ${DOCKER_USER}/dataflow-frontend:${IMAGE_TAG}
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh 'echo $PASS | docker login -u $USER --password-stdin'
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker push ${DOCKER_USER}/dataflow-backend:latest
                docker push ${DOCKER_USER}/dataflow-backend:${IMAGE_TAG}

                docker push ${DOCKER_USER}/dataflow-frontend:latest
                docker push ${DOCKER_USER}/dataflow-frontend:${IMAGE_TAG}
                '''
            }
        }

        stage('Start Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Verify') {
            steps {
                sh '''
                docker compose ps
                docker ps
                docker image ls
                '''
            }
        }
    }

    post {
        always {
            sh 'docker image ls'
        }

        success {
            echo 'Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}
