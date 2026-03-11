FROM wordpress:6.9.2-php8.2-apache

ARG ELEMENTOR_PLUGIN_URL=https://downloads.wordpress.org/plugin/elementor.zip
ARG ELEMENTOR_PRO_PLUGIN_URL=x
ARG ANGIE_PLUGIN_URL=https://downloads.wordpress.org/plugin/angie.latest-stable.zip

ENV ELEMENTOR_PLUGIN_URL=${ELEMENTOR_PLUGIN_URL}
ENV ELEMENTOR_PRO_PLUGIN_URL=${ELEMENTOR_PRO_PLUGIN_URL}
ENV ANGIE_PLUGIN_URL=${ANGIE_PLUGIN_URL}
ENV WORDPRESS_DB_HOST=localhost
ENV WORDPRESS_DB_USER=root
ENV WORDPRESS_DB_PASSWORD=root
ENV WORDPRESS_DB_NAME=wordpress
ENV MYSQL_ROOT_PASSWORD=root
ENV ELEMENTOR_DEBUG=1
ENV WP_DEBUG=1

RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    less \
    mariadb-client

RUN curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
    && chmod +x wp-cli.phar \
    && mv wp-cli.phar /usr/local/bin/wp

WORKDIR /var/www/html

COPY my.cnf /etc/my.cnf
COPY start-env.sh /usr/local/bin
RUN chmod +x /usr/local/bin/start-env.sh

EXPOSE 80

ENTRYPOINT ["start-env.sh"]
