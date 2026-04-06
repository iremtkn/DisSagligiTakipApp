pipeline {
    agent any

    tools {
        dotnetsdk 'dotnet8' 
    }

    stages {
        stage('Derleme (Build)') {
            steps {
                sh 'dotnet build DisSagligiTakipApp.slnx'
            }
        }
        stage('Selenium Testleri') {
            steps {
                sh 'dotnet test DisSagligiTakipApp.Tests'
            }
        }
    }
}