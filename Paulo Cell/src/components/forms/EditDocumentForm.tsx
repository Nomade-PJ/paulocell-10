import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { TrashIcon, PlusIcon, SaveIcon, X } from 'lucide-react';

const editDocumentFormSchema = z.object({
  customer: z.string(),
  manualCustomerName: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Descrição é obrigatória'),
    quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
    unitValue: z.number().min(0.01, 'Valor unitário deve ser maior que 0'),
    ncm: z.string().optional(),
    cfop: z.string().optional(),
  })),
  paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório'),
  observations: z.string().optional(),
  // Campos específicos para NF-e
  naturezaOperacao: z.string().optional(),
  // Campos específicos para NFC-e
  cpfCnpjConsumidor: z.string().optional(),
  // Campos específicos para NFS-e
  servicosPrestados: z.string().optional(),
  aliquotaIss: z.number().optional(),
});

type EditDocumentFormData = z.infer<typeof editDocumentFormSchema>;

interface EditDocumentFormProps {
  document: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EditDocumentForm: React.FC<EditDocumentFormProps> = ({ 
  document, 
  onSubmit,
  onCancel
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isManualCustomer = document.type === 'nfce' || document.type === 'nfse';

  // Setup the form with default values from the document
  const form = useForm<EditDocumentFormData>({
    resolver: zodResolver(editDocumentFormSchema),
    defaultValues: {
      customer: document.customerId || '',
      manualCustomerName: isManualCustomer ? document.customer || '' : '',
      items: document.items || [],
      paymentMethod: document.paymentMethod || '',
      observations: document.observations || '',
      naturezaOperacao: document.naturezaOperacao || '',
      cpfCnpjConsumidor: document.cpfCnpjConsumidor || '',
      servicosPrestados: document.servicosPrestados || '',
      aliquotaIss: document.aliquotaIss || 0,
    },
  });

  // Load customers from localStorage
  useEffect(() => {
    try {
      const savedCustomers = localStorage.getItem('pauloCell_customers');
      if (savedCustomers) {
        setCustomers(JSON.parse(savedCustomers));
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Erro ao carregar clientes');
    }
  }, []);

  const handleSubmit = (data: EditDocumentFormData) => {
    try {
      setIsLoading(true);

      // Validate items
      if (!data.items || data.items.length === 0) {
        toast.error('O documento deve ter pelo menos um item');
        setIsLoading(false);
        return;
      }

      // Determine o nome do cliente
      let customerName = document.customer;
      if (isManualCustomer) {
        // Use o nome digitado manualmente para NFC e NFS
        customerName = data.manualCustomerName || document.customer;
      } else {
        // Encontre o cliente no array customers para NF-e
        const customerObj = customers.find(c => c.id === data.customer);
        if (customerObj) {
          customerName = customerObj.name;
        }
      }

      // Create updated document
      const updatedDocument = {
        ...document,
        customer: customerName,
        customerId: isManualCustomer ? undefined : data.customer,
        items: data.items,
        paymentMethod: data.paymentMethod,
        observations: data.observations,
        naturezaOperacao: document.type === 'nfe' ? data.naturezaOperacao : undefined,
        cpfCnpjConsumidor: document.type === 'nfce' ? data.cpfCnpjConsumidor : undefined,
        servicosPrestados: document.type === 'nfse' ? data.servicosPrestados : undefined,
        aliquotaIss: document.type === 'nfse' ? data.aliquotaIss : undefined,
        value: data.items.reduce((total, item) => total + (item.quantity * item.unitValue), 0)
      };

      // Update document in localStorage
      const savedDocs = localStorage.getItem('pauloCell_documents');
      if (savedDocs) {
        const documents = JSON.parse(savedDocs);
        const updatedDocs = documents.map((doc: any) => 
          doc.id === document.id ? updatedDocument : doc
        );
        localStorage.setItem('pauloCell_documents', JSON.stringify(updatedDocs));
      }

      toast.success('Documento atualizado com sucesso');
      onSubmit(data);
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Erro ao atualizar documento');
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = () => {
    const items = form.getValues('items') || [];
    form.setValue('items', [
      ...items,
      { description: '', quantity: 1, unitValue: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const items = form.watch('items');
    if (items.length > 1) {
      form.setValue('items', items.filter((_, i) => i !== index));
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Editar Documento</h2>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={onCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {document.type === 'nfe' ? (
                <FormField
                  control={form.control}
                  name="customer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={document.status === 'Cancelada'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <FormField
                  control={form.control}
                  name="manualCustomerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Digite o nome do cliente" 
                          {...field} 
                          disabled={document.status === 'Cancelada'}
                        />
                      </FormControl>
                      <FormDescription>
                        Nome do cliente para este documento.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={document.status === 'Cancelada'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                        <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                        <SelectItem value="Transferência">Transferência</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {document.type === 'nfe' && (
              <FormField
                control={form.control}
                name="naturezaOperacao"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Natureza da Operação</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={document.status === 'Cancelada'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {document.type === 'nfce' && (
              <FormField
                control={form.control}
                name="cpfCnpjConsumidor"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>CPF/CNPJ do Consumidor</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={document.status === 'Cancelada'} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {document.type === 'nfse' && (
              <>
                <FormField
                  control={form.control}
                  name="servicosPrestados"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Serviços Prestados</FormLabel>
                      <FormControl>
                        <Textarea {...field} disabled={document.status === 'Cancelada'} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aliquotaIss"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Alíquota ISS (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          disabled={document.status === 'Cancelada'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <div className="mb-4">
              <FormLabel>Itens</FormLabel>
              <div className="space-y-4 mt-2">
                {form.watch('items')?.map((_, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="col-span-5">
                          <FormControl>
                            <Input 
                              {...field} 
                              placeholder="Descrição" 
                              disabled={document.status === 'Cancelada'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder="Qtd"
                              disabled={document.status === 'Cancelada'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitValue`}
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormControl>
                            <Input
                              type="number"
                              min="0.01"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                              placeholder="Valor unitário"
                              disabled={document.status === 'Cancelada'}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-2 flex space-x-1">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => removeItem(index)}
                        disabled={form.watch('items').length <= 1 || document.status === 'Cancelada'}
                        className="h-10 w-10"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                      {index === form.watch('items').length - 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon" 
                          onClick={addItem}
                          disabled={document.status === 'Cancelada'}
                          className="h-10 w-10"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Observações sobre o documento"
                      disabled={document.status === 'Cancelada'}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || document.status === 'Cancelada'}
              >
                {isLoading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
};

export default EditDocumentForm; 