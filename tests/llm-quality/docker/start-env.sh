#!/bin/bash
set -e

echo "=========================================="
echo "LLM Quality Test Environment"
echo "Elementor Version: ${ELEMENTOR_VERSION}"
echo "Elementor Pro Version: ${ELEMENTOR_PRO_VERSION}"
echo "Angie Version: ${ANGIE_VERSION}"
echo "=========================================="

wait_for_db() {
    echo "Waiting for database..."
    while ! mysqladmin ping -h $WORDPRESS_DB_HOST -p$WORDPRESS_DB_PASSWORD --silent 2>/dev/null; do
        sleep 1
    done
    echo "Database is ready"
}

install_wordpress() {
	echo "Installing WordPress..."
	user="${APACHE_RUN_USER:-www-data}"
	group="${APACHE_RUN_GROUP:-www-data}"
	pound='#'
	user="${user#$pound}"
	group="${group#$pound}"

	if [ ! -e index.php ] && [ ! -e wp-includes/version.php ]; then
		echo &>2 "WordPress not found in $PWD - copying now..."
				# if the directory exists and WordPress doesn't appear to be installed AND the permissions of it are root:root, let's chown it (likely a Docker-created directory)
		if [ "$uid" = '0' ] && [ "$(stat -c '%u:%g' .)" = '0:0' ]; then
			echo "Changing ownership of $PWD to $user:$group"
			chown "$user:$group" .
		fi
		if ! wp core is-installed --path="/usr/src/wordpress" --allow-root; then
			echo "Copying wp-config for docker to wp-config.php"
			cp /usr/src/wordpress/wp-config-docker.php wp-config.php
			cp /usr/src/wordpress/wp-config-docker.php /usr/src/wordpress/wp-config.php
			wp core install \
				--path="/usr/src/wordpress" \
				--url="http://localhost:8888" \
				--title="LLM Test Site" \
				--admin_user="admin" \
				--admin_password="password" \
				--admin_email="admin@example.com" \
				--allow-root
			# wp core update --version=6.6 --allow-root
		fi
	fi
}

install_plugins() {
	echo "Installing plugins..."
	echo "Installing Angie version: ${ANGIE_VERSION}"
	install_angie
	echo "Installing Elementor version: ${ELEMENTOR_VERSION}"
    if [ "${ELEMENTOR_VERSION}" = "latest" ]; then
        wp plugin install elementor --activate --allow-root || true
    else
        wp plugin install "https://downloads.wordpress.org/plugin/elementor.${ELEMENTOR_VERSION}.zip" --activate --allow-root || true
    fi
    echo "Configuring elementor plugin"
    configure_elementor
	echo "Installing elementor-hello theme"
    wp theme install hello-elementor --activate --allow-root || true

    # install_elementor_pro

    connect_elementor_license
}

install_elementor_pro() {
    echo "Installing Elementor Pro (version: ${ELEMENTOR_PRO_VERSION})..."
    if [ -n "${ELEMENTOR_PRO_PLUGIN_URL}" ]; then
        wp plugin install "${ELEMENTOR_PRO_PLUGIN_URL}" --activate --allow-root || true
    else
        echo "ELEMENTOR_PRO_PLUGIN_URL not set, skipping Elementor Pro installation"
    fi
}

connect_elementor_license() {
    echo "Connecting Elementor license..."
    # TODO: Implement Elementor Connect license verification
    # This step will trigger the license connection flow
    # Requires: ELEMENTOR_LICENSE_KEY or similar credential
    echo "PLACEHOLDER: License connection not yet implemented"
}

install_angie() {
    echo "Installing Angie (version: ${ANGIE_VERSION})..."
    if [ -n "${ANGIE_PLUGIN_URL}" ]; then
        wp plugin install "${ANGIE_PLUGIN_URL}" --activate --allow-root || true
    else
        echo "ANGIE_PLUGIN_URL not set, skipping Angie installation"
    fi
}

configure_elementor() {
	wp user meta add admin wp_persisted_preferences 'a:2:{s:14:\"core/edit-post\";a:2:{b:1;s:12:\"welcomeGuide\";b:0;}}' --allow-root
	wp option update elementor_checklist '{"last_opened_timestamp":null,"first_closed_checklist_in_editor":true,"is_popup_minimized":false,"steps":[],"should_open_in_editor":false,"editor_visit_count":10}' --allow-root
	wp elementor experiments activate e_atomic_elements,container,e_opt_in_v4,e_classes --allow-root
	wp option update e_editor_counter 10 --allow-root
	for id in $(wp user list --field=ID --allow-root)
		do wp user meta add "$id" "announcements_user_counter" 999 || echo "Announcement counter already set for user $id" --allow-root
	done
}

wait_for_db
# install_wordpress
install_plugins
# echo "Environment ready!"

exec docker-entrypoint.sh apache2-foreground &
install_plugins
wait
