#!/bin/bash
set -e

echo "=========================================="
echo "LLM Quality Test Environment"
echo "Elementor Plugin URL: ${ELEMENTOR_PLUGIN_URL}"
echo "Elementor Pro Plugin URL: ${ELEMENTOR_PRO_PLUGIN_URL}"
echo "Angie Plugin URL: ${ANGIE_PLUGIN_URL}"
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
		if [ "$uid" = '0' ] && [ "$(stat -c '%u:%g' .)" = '0:0' ]; then
			echo "Changing ownership of $PWD to $user:$group"
			chown "$user:$group" .
		fi
	cd /usr/src/wordpress
		cp /usr/src/wordpress/wp-config-docker.php /usr/src/wordpress/wp-config.php
		cp /usr/src/wordpress/wp-config-docker.php /var/www/html/wp-config.php
		wp core install \
			--path="/usr/src/wordpress" \
			--url="http://localhost:8888" \
			--title="LLM Test Site" \
			--admin_user="admin" \
			--admin_password="password" \
			--admin_email="admin@example.com" \
			--allow-root
		# wp core update --version=6.6 --allow-root
		cd /var/www/html
	fi
}

install_plugins() {
	echo "Installing plugins..."
	install_angie
	install_elementor
    echo "Configuring elementor plugin"
    configure_elementor
	echo "Installing elementor-hello theme"
    wp theme install hello-elementor --activate --allow-root || true

    # install_elementor_pro

    connect_elementor_license
}

install_elementor() {
    echo "Installing Elementor..."
    if [ -n "${ELEMENTOR_PLUGIN_URL}" ]; then
        wp plugin install "${ELEMENTOR_PLUGIN_URL}" --activate --allow-root || true
    else
        echo "ELEMENTOR_PLUGIN_URL not set, skipping Elementor installation"
    fi
}

install_elementor_pro() {
    echo "Installing Elementor Pro..."
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
    echo "Installing Angie..."
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
		do wp user meta add "$id" "announcements_user_counter" 999 --allow-root || echo "Announcement counter already set for user $id"
	done
}

wait_for_db
install_wordpress
exec docker-entrypoint.sh apache2-foreground 2>/dev/null &
install_plugins
wait

