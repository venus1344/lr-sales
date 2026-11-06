<?php

namespace Database\Seeders;

use App\Models\Ability;
use Illuminate\Database\Seeder;

class AbilitySeeder extends Seeder
{
    /**
     * Seed the 75 unique ERP abilities.
     *
     * The legacy `laraforma` database held 76 rows but duplicated
     * `internet_invoice_list`; it is seeded here exactly once.
     */
    public function run(): void
    {
        foreach ($this->abilities() as [$name, $label]) {
            Ability::firstOrCreate(['name' => $name], ['label' => $label]);
        }
    }

    /**
     * @return list<array{0: string, 1: string}>
     */
    protected function abilities(): array
    {
        return [
            // Items
            ['item_list', 'View items'],
            ['item_store', 'Create items'],
            ['item_update', 'Edit items'],
            ['item_remove', 'Remove items'],

            // Item categories
            ['item_category_list', 'View item category'],
            ['item_category_store', 'Create item category'],
            ['item_category_update', 'Edit item category'],
            ['item_category_remove', 'Remove item category'],

            // Suppliers
            ['supplier_list', 'View suppliers'],
            ['supplier_store', 'Create suppliers'],
            ['supplier_update', 'Edit suppliers'],
            ['supplier_remove', 'Remove suppliers'],

            // Packages
            ['package_list', 'View packages'],
            ['package_store', 'Create packages'],
            ['package_update', 'Edit packages'],
            ['package_remove', 'Remove packages'],

            // Customers
            ['customer_list', 'View customers'],
            ['customer_store', 'Create customers'],
            ['customer_update', 'Edit customers'],
            ['customer_remove', 'Remove customers'],

            // Income accounts
            ['income_account_list', 'View income accounts'],
            ['income_account_store', 'Create income accounts'],
            ['income_account_update', 'Edit income accounts'],
            ['income_account_remove', 'Remove income accounts'],

            // Expense accounts
            ['expense_account_list', 'View expense accounts'],
            ['expense_account_store', 'Create expense accounts'],
            ['expense_account_update', 'Edit expense accounts'],
            ['expense_account_remove', 'Remove expense accounts'],

            // Currencies
            ['currency_list', 'View currencies'],
            ['currency_store', 'Create currencies'],
            ['currency_update', 'Edit currencies'],
            ['currency_remove', 'Deactivate currencies'],

            // Settings
            ['view_settings', 'View settings'],
            ['set_settings', 'Do settings'],

            // Roles
            ['role_list', 'View roles'],
            ['role_store', 'Create roles'],
            ['role_update', 'Edit roles'],
            ['role_remove', 'Remove roles'],

            // Users
            ['user_list', 'View users'],
            ['user_store', 'Create users'],
            ['user_update', 'Edit users'],
            ['user_remove', 'Remove users'],

            // Expenses
            ['expense_list', 'View expenses'],
            ['expense_store', 'Create expenses'],
            ['expense_update', 'Edit expenses'],
            ['expense_remove', 'Remove expenses'],

            // Proformas
            ['proforma_list', 'View proformas'],
            ['proforma_store', 'Create proformas'],
            ['proforma_update', 'Edit proformas'],
            ['proforma_remove', 'Remove proformas'],
            ['proforma_print', 'Print proformas'],

            // Invoices
            ['invoice_list', 'View invoices'],
            ['invoice_store', 'Create invoices'],
            ['invoice_update', 'Edit invoices'],
            ['invoice_remove', 'Remove invoices'],
            ['invoice_print', 'Print invoices'],

            // Delivery notes
            ['dnote_list', 'View delivery notes'],
            ['dnote_store', 'Create delivery notes'],
            ['dnote_update', 'Edit delivery notes'],
            ['dnote_remove', 'Remove delivery notes'],
            ['dnote_print', 'Print delivery notes'],

            // Local purchase orders
            ['lpo_list', 'View LPO'],
            ['lpo_store', 'Create LPO'],
            ['lpo_update', 'Edit LPO'],
            ['lpo_remove', 'Remove LPO'],
            ['lpo_print', 'Print LPO'],

            // Internet invoices
            ['internet_invoice_list', 'View internet invoice'],
            ['internet_invoice_store', 'Create internet invoice'],
            ['internet_invoice_update', 'Edit internet invoice'],
            ['internet_invoice_remove', 'Remove internet invoice'],
            ['internet_invoice_print', 'Print internet invoice'],

            // Projects
            ['project_list', 'View project'],
            ['project_store', 'Create project'],
            ['project_update', 'Edit project'],
            ['project_remove', 'Remove project'],
        ];
    }
}
