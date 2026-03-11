FROM wordpress:6.9.2-php8.2-apache

ARG ELEMENTOR_VERSION=latest
ARG ELEMENTOR_PRO_VERSION=latest
ARG ANGIE_VERSION=latest

ENV ELEMENTOR_VERSION=${ELEMENTOR_VERSION}
ENV ELEMENTOR_PRO_VERSION=${ELEMENTOR_PRO_VERSION}
ENV ANGIE_VERSION=${ANGIE_VERSION}
ENV ANGIE_PLUGIN_URL=https://downloads.wordpress.org/plugin/angie.latest-stable.zip
ENV WORDPRESS_DB_HOST=localhost
ENV WORDPRESS_DB_USER=root
ENV WORDPRESS_DB_PASSWORD=root
ENV WORDPRESS_DB_NAME=wordpress
ENV MYSQL_ROOT_PASSWORD=root

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
