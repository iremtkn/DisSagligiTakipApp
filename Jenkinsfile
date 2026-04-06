pipeline {
    agent any

    environment {
        DOTNET_SYSTEM_GLOBALIZATION_INVARIANT = 'true'
    }

    tools {
        dotnetsdk 'dotnet8' 
    }

    stages {
        stage('Derleme (Build)') {
            steps {
                echo 'API Projesi Derleniyor...'
                dir('DisSagligiTakipApp.API') {
                    sh 'dotnet build'
                }
            }
        }
        stage('Selenium Testleri') {
            steps {
                echo 'Testler Baslatiliyor...'
                dir('DisSagligiTakipApp.Tests') {
                    sh 'dotnet test'
                }
            }
        }
    }
}