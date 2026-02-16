<?php

namespace Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Switch_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Video_Control;
use Elementor\Modules\AtomicWidgets\Elements\Base\Atomic_Element_Base;
use Elementor\Modules\AtomicWidgets\Elements\Base\Has_Element_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Attributes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Classes_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Dimensions_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\Boolean_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Primitives\String_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Size_Prop_Type;
use Elementor\Modules\AtomicWidgets\PropTypes\Video_Src_Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;
use Elementor\Modules\Components\PropTypes\Overridable_Prop_Type;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Background_Video\Atomic_Bgvideo_Controls;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Svg\Atomic_Svg;
use Elementor\Modules\AtomicWidgets\Elements\Loader\Frontend_Assets_Loader;
use Elementor\Utils;

class Atomic_Background_Video extends Atomic_Element_Base {
	use Has_Element_Template;

	public static $widget_description = 'Container with background video';

	public function __construct( $data = [], $args = null ) {
		parent::__construct( $data, $args );
		$this->meta( 'is_container', true );
	}

	public static function get_type() {
		return 'e-background-video';
	}

	public static function get_element_type(): string {
		return 'e-background-video';
	}

	public function get_title() {
		return esc_html__( 'Background Video', 'elementor' );
	}

	protected static function define_props_schema(): array {
		return [
			'classes' => Classes_Prop_Type::make()->default( [] ),
			'source' => Video_Src_Prop_Type::make()->optional(),
			'autoplay' => Boolean_Prop_Type::make()->default( true ),
			'muted' => Boolean_Prop_Type::make()->default( true ),
			'loop' => Boolean_Prop_Type::make()->default( false ),
			'include_controls' => Boolean_Prop_Type::make()->default( true ),
			'attributes' => Attributes_Prop_Type::make()->meta( Overridable_Prop_Type::ignore() ),
		];
	}

	protected function define_atomic_controls(): array {
		return [
			Section::make()
				->set_label( __( 'Content', 'elementor' ) )
				->set_id( 'content' )
				->set_items( [
					Video_Control::bind_to( 'source' )->set_label( esc_html__( 'Video', 'elementor' ) ),
					Switch_Control::bind_to( 'autoplay' )->set_label( esc_html__( 'Autoplay', 'elementor' ) ),
					Switch_Control::bind_to( 'loop' )->set_label( esc_html__( 'Loop', 'elementor' ) ),
					Switch_Control::bind_to( 'muted' )->set_label( esc_html__( 'Muted', 'elementor' ) ),
					Switch_Control::bind_to( 'include_controls' )->set_label( esc_html__( 'Player Controls', 'elementor' ) ),
				]),
		];
	}

	protected function define_base_styles(): array
	{
		return [
			'base' => Style_Definition::make()
				->add_variant(
					Style_Variant::make()
						->add_prop( 'display', String_Prop_Type::generate( 'block' ) )
						->add_prop( 'overflow', String_Prop_Type::generate( 'hidden' ) )
						->add_prop( 'position', String_Prop_Type::generate( 'relative' ) )
						->add_prop( 'z-index', String_Prop_Type::generate( 'auto' ) )
						->add_prop('padding', Dimensions_Prop_Type::generate([
							'block-start' => Size_Prop_Type::generate([
									'size' => 0,
									'unit' => 'px',
								]),
							'block-end' => Size_Prop_Type::generate([
									'size' => 0,
									'unit' => 'px',
								]),
							'inline-start' => Size_Prop_Type::generate([
									'size' => 0,
									'unit' => 'px',
								]),
							'inline-end' => Size_Prop_Type::generate([
									'size' => 0,
									'unit' => 'px',
								]),
							])
					)
				)
		];
	}

	public function get_script_depends()
	{
		$global_depends = parent::get_script_depends();
		return array_merge( $global_depends, [
			'elementor-background-video-handler',
		] );
	}

	public function register_frontend_handlers()
	{
		$assets_url = ELEMENTOR_ASSETS_URL;
		$min_suffix = ( Utils::is_script_debug() || Utils::is_elementor_tests() ) ? '' : '.min';

		wp_register_script(
			'elementor-background-video-handler',
			"{$assets_url}js/background-video-handler{$min_suffix}.js",
			[ Frontend_Assets_Loader::FRONTEND_HANDLERS_HANDLE ],
			ELEMENTOR_VERSION,
			true
		);
	}

	protected function get_templates(): array
	{
		return [
			'elementor/elements/atomic-background-video' => __DIR__ . '/atomic-background-video.html.twig',
		];
	}

  protected function define_default_children()
  {
  	return [
			Atomic_Bgvideo_Controls::generate()
				->editor_settings( [
					'title' => esc_html__( 'Video Controls', 'elementor'  )
				])
				->children( [
						Atomic_Bgvideo_Play_Button::generate()
						->editor_settings( [
							'title' => esc_html__( 'Play Button', 'elementor'  )
						])
						->children( [
							Atomic_Svg::generate()->build()
						] )
						->is_locked( true )->build(),
				Atomic_Bgvideo_Pause_Button::generate()
						->editor_settings( [
							'title' => esc_html__( 'Play Button', 'elementor'  )
						])
						->children( [
							Atomic_Svg::generate()->build()
						] )
						->is_locked( true )->build(),
				] )
				->is_locked( true )->build(),
		];
  }
}
