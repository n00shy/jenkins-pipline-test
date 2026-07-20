pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Images') {
            steps {
                sh 'docker compose build'
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
                sh 'docker compose push'
            }
        }

        stage('Start Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Verify') {
            steps {
                sh 'docker compose ps'
                sh 'docker ps'
            }
        }
    }

    post {
        always {
            sh 'docker image ls'
        }
    }
}
