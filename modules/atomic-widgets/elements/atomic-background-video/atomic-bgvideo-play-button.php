<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video;

use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;

class Atomic_Bgvideo_Play_Button extends Atomic_Element_Base {
	use Has_Element_Template;

	public static function get_type() {
		return 'e-bgvideo-play-button';
	}

	public static function get_element_type(): string {
		return 'e-bgvideo-play-button';
	}

	public function get_icon() {
		return 'eicon-play';
	}

	public function get_title() {
		return esc_html__( 'Play Button', 'elementor' );
	}

	public function get_keywords() {
		return [];
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [];
	}

	protected function define_base_styles(): array
	{
		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', String_Prop_Type::generate( 'inline-flex' ) )
				)
		];
	}


	public function should_show_in_panel() {
		return false;
	}

	protected function get_templates(): array {
		return [
			'elementor/elements/atomic-bgvideo-play-button' => __DIR__ . '/simple-wrapper.html.twig',
		];
	}
}
