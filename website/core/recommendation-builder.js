/**
 * ============================================================
 * Recommendation Builder
 * ============================================================
 *
 * Generates related content suggestions.
 */

export default class RecommendationBuilder {

    build(content) {

        const recommendations = {};

        for (const object of content) {

            const scores = [];

            for (const candidate of content) {

                if (candidate === object)
                    continue;

                let score = 0;

                score += this.shared(
                    object.metadata.topics,
                    candidate.metadata.topics
                ) * 5;

                score += this.shared(
                    object.metadata.themes,
                    candidate.metadata.themes
                ) * 4;

                score += this.shared(
                    object.metadata.tags,
                    candidate.metadata.tags
                );

                scores.push({

                    id: candidate.metadata.id,

                    score

                });

            }

            recommendations[object.metadata.id] =
                scores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10);

        }

        return recommendations;

    }

    shared(a = [], b = []) {

        return a.filter(x => b.includes(x)).length;

    }

}
