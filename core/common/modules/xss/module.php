<?php

namespace Elementor\Core\Common\Modules\Xss;

use WP_REST_Request;

class Module {

	/**
	 * @property {Module}
	 */
	private static $_instance;

	public static function instance(): Module {
		if ( ! self::$_instance ) {
			self::$_instance = new Module();
		}

		return self::$_instance;
	}

	private function __construct() {
		add_filter( 'rest_pre_insert_post', [ $this, 'check_post_data' ], 10, 2 );
	}

	public function check_post_data( $post, WP_REST_Request $request ) {
		// NOTE: This utility prefents from users without the unfiltered_html permission to create/update Elementor posts via wordpress REST api with unallowed tags
		if ( current_user_can( 'unfiltered_html' ) ) {
			return $post;
		}
		$request_body = json_decode( $request->get_body() );
		$meta = $request_body->meta;
		if ( is_null( $meta ) ) {
			return $post;
		}
		$elementor_data = $meta->_elementor_data ?? [];
		if ( is_string( $elementor_data ) ) {
			$elementor_data = json_decode( $elementor_data );
		}
		if ( is_null( $elementor_data ) ) {
			return $post;
		}

		$elementor_data = map_deep( $elementor_data, function ( $value ) {
			return is_bool( $value ) || is_null( $value ) ? $value : wp_kses_post( $value );
		} );
		$request_body->meta->_elementor_data = json_encode( $elementor_data );
		$request->set_body( json_encode( $request_body ) );

		return $post;
	}

}
