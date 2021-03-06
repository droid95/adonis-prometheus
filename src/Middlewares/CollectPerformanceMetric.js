"use strict";

const Config = use("Config");
const metrics = require("../Metrics");

class CollectPerformanceMetric {
  async handle({ request, response }, next) {
    /**
     * Extract config.
     */
    const { enabled: enableHttpMetric, includeQueryParams } = Config.get(
      "prometheus.httpMetric.enabled"
    );
    const enableThroughputMetric = Config.get(
      "prometheus.throughputMetric.enabled"
    );

    /**
     * Start HTTP request timer.
     */
    let stopHttpRequestTimer;
    if (enableHttpMetric) {
      stopHttpRequestTimer = metrics.httpMetric.startTimer({
        method: request.method(),
        url: includeQueryParams ? request.originalUrl() : url(),
      });
    }

    /**
     * Continue execution.
     */
    await next();

    /**
     * Track request throughput..
     */
    if (enableThroughputMetric) metrics.throughputMetric.inc();

    /**
     * End HTTP request timer.
     */
    if (enableHttpMetric) {
      stopHttpRequestTimer({
        statusCode: response.response.statusCode,
      });
    }
  }
}

module.exports = CollectPerformanceMetric;
