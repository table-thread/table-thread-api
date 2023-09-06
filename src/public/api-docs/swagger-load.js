window.onload = function () {
    let url = "https://srvitality.com/swagger.yaml"
    var arr = window.location.href.split('?url=');
    if (arr.length > 1) {
        url = arr[1]
    }
    // Begin Swagger UI call region
    const ui = SwaggerUIBundle({
        url: url,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset
        ],
        plugins: [
            SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
    });
    // End Swagger UI call region
    window.ui = ui;
};