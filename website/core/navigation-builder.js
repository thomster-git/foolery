/**
 * ============================================================
 * Navigation Builder
 * ============================================================
 *
 * Builds Atlas navigation indexes.
 */

export default class NavigationBuilder {

    build(content) {

        const navigation = {

            byType: {},

            byTopic: {},

            byTheme: {}

        };

        for (const object of content) {

            //--------------------------------------------------
            // Types
            //--------------------------------------------------

            const type = object.metadata.type;

            navigation.byType[type] ??= [];

            navigation.byType[type].push(object.metadata.id);

            //--------------------------------------------------
            // Topics
            //--------------------------------------------------

            for (const topic of object.metadata.topics) {

                navigation.byTopic[topic] ??= [];

                navigation.byTopic[topic].push(
                    object.metadata.id
                );

            }

            //--------------------------------------------------
            // Themes
            //--------------------------------------------------

            for (const theme of object.metadata.themes) {

                navigation.byTheme[theme] ??= [];

                navigation.byTheme[theme].push(
                    object.metadata.id
                );

            }

        }

        return navigation;

    }

}
