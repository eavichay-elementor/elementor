<?php

namespace Elementor\Modules\Sdk\V4\Builder;

use Exception;

// phpcs:ignore Generic.PHP.Syntax.PHPSyntax
enum SUPPORTED_PROPERTY_TYPES: string {

	case IMAGE = 'image';
	case LINK = 'link';
	case BOOLEAN = 'boolean';
	case BOOL = 'bool';
	case SWITCH = 'switch';
	case TEXT = 'text';
	case SELECT = 'select';
	case TEXT_AREA = 'text_area';

	public static function is( string $value ): string {
		foreach ( self::cases() as $type ) {
			if ( $type->value === $value ) {
				return $value;
			}
		}
		throw new Exception( esc_html( "Unsupported property type {$value}" ) );
	}
}
