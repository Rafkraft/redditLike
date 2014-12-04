module.exports = function(grunt) {

    // Configuration de Grunt
    grunt.initConfig({
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    'public/css/main.css': 'public/css/main.scss',
                    'public/css/nav.css': 'public/css/nav.scss',
                    'public/css/subReddit.css': 'public/css/subReddit.scss',
                    'public/css/newPost.css': 'public/css/newPost.scss',
                    'public/css/post.css': 'public/css/post.scss',
                    'public/css/index.css': 'public/css/index.scss',
                    'public/css/subRedditsList.css': 'public/css/subRedditsList.scss'
                }
            }
        }
    });

    
    grunt.loadNpmTasks('grunt-sass');

    // Définition des tâches Grunt
    grunt.registerTask('default', ['sass']);
};