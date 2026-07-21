pipeline {
    agent any

    environment {
        DOCKER_USER = "abdullahahmed1101076"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Gitleaks Scan') {
            steps {
                sh '''
                    gitleaks git \
                      --verbose
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    docker compose build

                    docker tag ${DOCKER_USER}/dataflow-backend:latest ${DOCKER_USER}/dataflow-backend:${IMAGE_TAG}
                    docker tag ${DOCKER_USER}/dataflow-frontend:latest ${DOCKER_USER}/dataflow-frontend:${IMAGE_TAG}
                '''
            }
        }

        stage('Trivy Scan') {
            steps {
                sh '''
                    trivy image \
                      --scanners vuln \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      --no-progress \
                      ${DOCKER_USER}/dataflow-backend:${IMAGE_TAG}

                    trivy image \
                      --scanners vuln \
                      --severity HIGH,CRITICAL \
                      --exit-code 1 \
                      --no-progress \
                      ${DOCKER_USER}/dataflow-frontend:${IMAGE_TAG}
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push ${DOCKER_USER}/dataflow-backend:${IMAGE_TAG}
                    docker push ${DOCKER_USER}/dataflow-backend:latest

                    docker push ${DOCKER_USER}/dataflow-frontend:${IMAGE_TAG}
                    docker push ${DOCKER_USER}/dataflow-frontend:latest
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose down || true
                    docker compose up -d
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    docker compose ps
                    docker ps

                    curl -f http://localhost:5000 || true
                    curl -f http://localhost:3000 || true
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker image ls
                docker system df
            '''
        }

        cleanup {
            sh '''
                docker image prune -af || true
                docker builder prune -af || true
            '''
        }

        success {
            echo '✅ Pipeline completed successfully.'
        }

        failure {
            echo '❌ Pipeline failed.'
        }
    }
}
