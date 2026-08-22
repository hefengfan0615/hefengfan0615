addEventListener("fetch", function(event) {
	if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") {
		return;
	}
	event.respondWith(
		fetch(event.request)
			.then(function(response) {
				// Check if the response is valid
				if (!response || response.status < 200 || response.status >= 600) {
					return;
				}

				const newHeaders = new Headers(response.headers);
				newHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
				newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
				const moddedResponse = new Response(response.body, {
					status: response.status,
					statusText: response.statusText,
					headers: newHeaders,
				});

				return moddedResponse;
			})
			.catch(function(e) {
				console.error(e);
			})
	);
});
