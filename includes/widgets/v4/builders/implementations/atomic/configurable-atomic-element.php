<?php

namespace Elementor\V4\Widgets\Builders\Implementations\Atomic;

use Elementor\Core\Utils\Registry;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Control_Base;
use Elementor\Modules\AtomicWidgets\Elements\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Elements\Has_Template;
use Elementor\Modules\AtomicWidgets\PropTypes\Contracts\Prop_Type;
use Elementor\Modules\AtomicWidgets\Styles\Style_Definition;
use Elementor\Modules\AtomicWidgets\Styles\Style_Variant;

class Configurable_Atomic_Element extends Atomic_Widget_Base {
    use Has_Template;
    public static function get_namespace() {
        return __NAMESPACE__;
    }

    /**
     * @var Prop_Type[] | null
     */
    protected static $built_props_schema = null;

    /**
     * @var Atomic_Control_Base[] | null
     */
    protected $built_controls = null;

    protected $_template_contents_cache = null;

    protected function get_templates(): array {
        if (null === $this->_template_contents_cache) {
            $builder = Registry::get_value('elementor/widget-builders', static::class, null);
            $builder->build_renderer();
            $twig_file_path = Registry::instance('elementor/widget-twig')->get(static::class);
            $css_file_path = Registry::instance('elementor/widget-css')->get(static::class);
            if ($twig_file_path) {
                $twig_key = 'elementor/templates/' . static::class . '/twig';
                $this->_template_contents_cache = [
                    $twig_key => $twig_file_path,
                ];
            }
        }
        return $this->_template_contents_cache ?? [];
    }


    protected static function get_static_schema(): array {
        $builder = Registry::get_value('elementor/widget-builders', static::class, null);
        return $builder->get_widget_schema();
    }

    protected function get_widget_schema(): array {
        $builder = Registry::get_value('elementor/widget-builders', static::class, null);
        return $builder->get_widget_schema();
    }

    public static function get_element_type(): string {
        $schema = static::get_static_schema();
        return $schema['name'] ?? 'e-atomic';
    }

    public function get_title(): string {
        $schema = $this->get_widget_schema();
        return $schema['title'] ?? '';
    }


    protected function define_atomic_controls(): array {
        return [];
    }

    protected function get_settings_controls(): array {
        if (null === $this->built_controls) {
            $builder = Registry::get_value('elementor/widget-builders', static::class, null);
            $this->built_controls = $builder->build_controls();
        }
        if (count($this->built_controls) > 0) {

        }
        return $this->built_controls;
    }

    public static function define_props_schema(): array {
        $props_schema = Registry::get_value('elementor/widget-prop-schema', static::class, null);
        if (null === $props_schema) {
            $builder = Registry::get_value('elementor/widget-builders', static::class, null);
            $builder->build_props_schema();
        }
        $props_schema = Registry::get_value('elementor/widget-prop-schema', static::class, null);
        return $props_schema;
    }

    protected function build_default_render_context() {
		return [
			'id' => $this->get_id(),
			'type' => $this->get_name(),
			'settings' => $this->get_atomic_settings(),
			'base_styles' => $this->get_base_styles_dictionary(),
		];
	}

    protected function define_base_styles(): array {
        $base_styles = Registry::get_value('elementor/widget-base-styles', static::class, null);
        if (null === $base_styles) {
            return [
                'base' => Style_Definition::make()->add_variant(
                    Style_Variant::make()->add_prop('all', 'unset')
                ),
            ];
        }
        return $base_styles;
    }
}