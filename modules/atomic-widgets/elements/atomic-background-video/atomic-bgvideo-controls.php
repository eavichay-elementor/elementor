<?php


namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video;

use Elementor\Modules\AtomicWidgets\Elements\Flexbox\Flexbox;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;

class Atomic_Bgvideo_Controls extends Flexbox {
	public static function get_type() {
		return 'e-bgvideo-controls';
	}

	public static function get_element_type(): string {
		return 'e-bgvideo-controls';
	}

	public function get_title()
	{
		return esc_html__( 'Video Controls', 'elementor' );
	}

	public function should_show_in_panel() {
		return false;
	}

	protected function get_base_padding(): array
	{
		return Size_Prop_Type::generate( [
			'size' => 0,
			'unit' => 'px',
		]);
	}

	protected function define_allowed_child_types()
	{
		return [ 'e-atomic-bgvideo-play-button' ];
	}

}
