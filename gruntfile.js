module.exports = function(grunt) {

    // Configuration de Grunt
    grunt.initConfig({
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'public/css/main.css': 'public/css/main.scss'
                }
            }
        }
    });

    
    grunt.loadNpmTasks('grunt-sass');

    // Définition des tâches Grunt
    grunt.registerTask('default', ['sass']);
};